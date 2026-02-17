import { useState, useCallback, useMemo } from 'react';
import { 
  type Reference, 
  type Citation, 
  type Insight,
  type Challenge,
  type VerificationStatus,
  createReference,
  createCitation,
  createChallenge,
  validateInsight,
  generateReferenceTable,
} from '@/lib/insightValidation';

interface UseReferenceLibraryOptions {
  projectId: string;
  onSave?: (data: ReferenceLibraryData) => void;
}

export interface ReferenceLibraryData {
  references: Reference[];
  insights: Insight[];
  projectId: string;
  lastUpdated: string;
}

export function useReferenceLibrary({ projectId, onSave }: UseReferenceLibraryOptions) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  
  // Add a new reference
  const addReference = useCallback((data: Partial<Reference>) => {
    const newRef = createReference(projectId, data);
    setReferences(prev => [...prev, newRef]);
    return newRef;
  }, [projectId]);
  
  // Update reference status
  const updateReferenceStatus = useCallback((
    referenceId: string, 
    status: VerificationStatus,
    verifiedBy?: string
  ) => {
    setReferences(prev => prev.map(ref => 
      ref.id === referenceId 
        ? { 
            ...ref, 
            verificationStatus: status,
            verifiedBy,
            verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
          }
        : ref
    ));
  }, []);
  
  // Delete reference
  const deleteReference = useCallback((referenceId: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== referenceId));
    // Also remove citations pointing to this reference
    setInsights(prev => prev.map(insight => ({
      ...insight,
      citations: insight.citations.filter(c => c.referenceId !== referenceId),
    })));
  }, []);
  
  // Add insight
  const addInsight = useCallback((data: Omit<Insight, 'id' | 'createdAt' | 'challenges' | 'citations'>) => {
    const newInsight: Insight = {
      ...data,
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      challenges: [],
      citations: [],
    };
    setInsights(prev => [...prev, newInsight]);
    return newInsight;
  }, []);
  
  // Add citation to insight
  const addCitationToInsight = useCallback((
    insightId: string,
    referenceId: string,
    citationData: Partial<Citation>
  ) => {
    const newCitation = createCitation(referenceId, insightId, citationData);
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? { ...insight, citations: [...insight.citations, newCitation] }
        : insight
    ));
    return newCitation;
  }, []);
  
  // Remove citation from insight
  const removeCitationFromInsight = useCallback((insightId: string, citationId: string) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? { ...insight, citations: insight.citations.filter(c => c.id !== citationId) }
        : insight
    ));
  }, []);
  
  // Challenge an insight
  const challengeInsight = useCallback((
    insightId: string,
    challengerId: string,
    challengerName: string,
    question: string
  ) => {
    const challenge = createChallenge(insightId, challengerId, challengerName, question);
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? { 
            ...insight, 
            challenges: [...insight.challenges, challenge],
            verificationStatus: 'challenged' as VerificationStatus,
          }
        : insight
    ));
    return challenge;
  }, []);
  
  // Respond to challenge
  const respondToChallenge = useCallback((
    insightId: string,
    challengeId: string,
    response: string,
    accepted: boolean
  ) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? {
            ...insight,
            challenges: insight.challenges.map(c =>
              c.id === challengeId
                ? {
                    ...c,
                    response,
                    status: accepted ? 'accepted' : 'rejected',
                    respondedAt: new Date().toISOString(),
                  }
                : c
            ),
          }
        : insight
    ));
  }, []);
  
  // Verify insight
  const verifyInsight = useCallback((insightId: string, verifiedBy: string) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? {
            ...insight,
            verificationStatus: 'verified' as VerificationStatus,
            validatedAt: new Date().toISOString(),
            validatedBy: verifiedBy,
          }
        : insight
    ));
  }, []);
  
  // Update insight status
  const updateInsightStatus = useCallback((insightId: string, status: VerificationStatus) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? { ...insight, verificationStatus: status }
        : insight
    ));
  }, []);
  
  // Get validation results for all insights
  const validationResults = useMemo(() => {
    return insights.map(insight => ({
      insight,
      validation: validateInsight(insight),
    }));
  }, [insights]);
  
  // Get insights needing attention
  const insightsNeedingAttention = useMemo(() => {
    return validationResults
      .filter(({ validation }) => !validation.isValid || validation.issues.length > 0)
      .map(({ insight }) => insight);
  }, [validationResults]);
  
  // Get unverified references
  const unverifiedReferences = useMemo(() => {
    return references.filter(ref => ref.verificationStatus !== 'verified');
  }, [references]);
  
  // Generate reference table markdown
  const referenceTableMarkdown = useMemo(() => {
    return generateReferenceTable(references);
  }, [references]);
  
  // Stats
  const stats = useMemo(() => ({
    totalInsights: insights.length,
    verifiedInsights: insights.filter(i => i.verificationStatus === 'verified').length,
    pendingInsights: insights.filter(i => i.verificationStatus === 'pending').length,
    challengedInsights: insights.filter(i => i.verificationStatus === 'challenged').length,
    totalReferences: references.length,
    verifiedReferences: references.filter(r => r.verificationStatus === 'verified').length,
    totalCitations: insights.reduce((sum, i) => sum + i.citations.length, 0),
    totalChallenges: insights.reduce((sum, i) => sum + i.challenges.length, 0),
  }), [insights, references]);
  
  // Save library data
  const saveLibrary = useCallback(() => {
    const data: ReferenceLibraryData = {
      references,
      insights,
      projectId,
      lastUpdated: new Date().toISOString(),
    };
    onSave?.(data);
    return data;
  }, [references, insights, projectId, onSave]);
  
  // Load library data
  const loadLibrary = useCallback((data: ReferenceLibraryData) => {
    setReferences(data.references);
    setInsights(data.insights);
  }, []);
  
  // Clear library
  const clearLibrary = useCallback(() => {
    setReferences([]);
    setInsights([]);
  }, []);
  
  return {
    // Data
    references,
    insights,
    stats,
    validationResults,
    insightsNeedingAttention,
    unverifiedReferences,
    referenceTableMarkdown,
    
    // Reference operations
    addReference,
    updateReferenceStatus,
    deleteReference,
    
    // Insight operations
    addInsight,
    addCitationToInsight,
    removeCitationFromInsight,
    challengeInsight,
    respondToChallenge,
    verifyInsight,
    updateInsightStatus,
    
    // Library operations
    saveLibrary,
    loadLibrary,
    clearLibrary,
  };
}

// ============================================================================
// chief of staff VALIDATION HOOK
// ============================================================================

interface UseDigitalTwinValidationOptions {
  twinName?: string;
  autoChallenge?: boolean;
}

export function useDigitalTwinValidation({ 
  twinName = 'Chief of Staff',
  autoChallenge = false,
}: UseDigitalTwinValidationOptions = {}) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationQueue, setValidationQueue] = useState<Insight[]>([]);
  
  // Queue insight for validation
  const queueForValidation = useCallback((insight: Insight) => {
    setValidationQueue(prev => [...prev, insight]);
  }, []);
  
  // Process validation queue
  const processNextInQueue = useCallback(() => {
    if (validationQueue.length === 0) return null;
    
    const [next, ...rest] = validationQueue;
    setValidationQueue(rest);
    return next;
  }, [validationQueue]);
  
  // Generate Chief of Staff challenge
  const generateChallenge = useCallback((insight: Insight): Challenge => {
    const validation = validateInsight(insight);
    
    // Determine best challenge question based on issues
    let question = "Can you verify the accuracy of this statement?";
    
    if (validation.issues.some(i => i.type === 'missing_source')) {
      question = "What is your primary source for this claim? Please provide a specific reference.";
    } else if (validation.issues.some(i => i.type === 'potential_hallucination')) {
      question = "Are you certain this is accurate, or could you be confabulating? Please verify against current data.";
    } else if (validation.issues.some(i => i.type === 'opinion_as_fact')) {
      question = "Is this a verifiable fact or your professional opinion? Please clarify.";
    } else if (insight.confidence === 'speculative') {
      question = "What assumptions underlie this speculation? What would change your assessment?";
    }
    
    return createChallenge(insight.id, 'digital_twin', twinName, question);
  }, [twinName]);
  
  // Auto-validate insight
  const autoValidate = useCallback(async (insight: Insight): Promise<{
    isValid: boolean;
    challenges: Challenge[];
    recommendations: string[];
  }> => {
    setIsValidating(true);
    
    try {
      const validation = validateInsight(insight);
      const challenges: Challenge[] = [];
      const recommendations: string[] = [];
      
      // Generate challenges for critical issues
      if (!validation.isValid && autoChallenge) {
        const challenge = generateChallenge(insight);
        challenges.push(challenge);
      }
      
      // Add recommendations
      if (validation.requiredReferences.length > 0) {
        recommendations.push(`Add references: ${validation.requiredReferences.join(', ')}`);
      }
      
      validation.suggestions.forEach(s => recommendations.push(s));
      
      return {
        isValid: validation.isValid,
        challenges,
        recommendations,
      };
    } finally {
      setIsValidating(false);
    }
  }, [autoChallenge, generateChallenge]);
  
  return {
    isValidating,
    validationQueue,
    queueLength: validationQueue.length,
    queueForValidation,
    processNextInQueue,
    generateChallenge,
    autoValidate,
  };
}
